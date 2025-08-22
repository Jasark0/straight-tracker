import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

export async function GET(request: Request) {
    const { searchParams, origin} = new URL(request.url);
  const code = searchParams.get("code");

  const next = searchParams.get("next") ?? "/history";

  const generateUsername = () => {
    return uniqueNamesGenerator({
        dictionaries: [adjectives, animals],
        length: 2,
        separator: '-',
    }) + Math.floor(Math.random() * 1000);
}

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
            const { data, error: userError } = await supabase.auth.getUser();


            if (userError) {
                console.error("Error fetching user data:", userError.message);
                return NextResponse.redirect(`${origin}/error`);
            }

            const { data: existingUser } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("email", data?.user?.email)
                .limit(1)
                .single();

            let username: string;
            let avatar_url: string | undefined;

            if (!existingUser) {
                let usernameIsUnique = false;
                let randomUsername = generateUsername(); 

                while (usernameIsUnique === false) {
                    const {data: usernameID} = await supabaseAdmin
                    .from("profiles")
                    .select("username")
                    .contains("username", randomUsername.toString());

                    if (!usernameID) {
                        usernameIsUnique = true; 
                    }
                    else
                    {
                        randomUsername = generateUsername();
                    }
                    
                }

                username = randomUsername.toString();


                const { error: dbError } = await supabaseAdmin.from("profiles").insert({
                    id: data?.user?.id,
                    email: data?.user?.email,
                    username: username, 
                    created_at: new Date().toISOString(),
                    // options:{ display name and username mixed up idk we'll figure this out later
                    //     data: {
                    //         display_name: data?.user?.user_metadata?.full_name || "User",
                    //     }
                    // }
                });

                if (dbError) {
                    console.error("Error inserting user into database:", dbError.message);
                    return NextResponse.redirect(`${origin}/error`);
                }
            } else {
                username = existingUser.username;
                avatar_url = existingUser.avatar_url;
            }

            const { data: updatedUser, error} = await supabase.auth.updateUser({
                data: {
                    display_name: username,
                    username: username, 
                    nickname: data?.user?.user_metadata?.nickname || null,
                    avatar_url: avatar_url
                }
            })
            
            
            const forwardedHost = request.headers.get("x-forwarded-host"); 
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }
    
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 

