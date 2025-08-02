import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/src/lib/supabaseAdmin'

export async function GET(request: Request) {
    const { searchParams, origin} = new URL(request.url);
  const code = searchParams.get("code");

  const next = searchParams.get("next") ?? "/history";

  



    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
            const { data, error: userError } = await supabase.auth.getUser();


            if (userError) {
                console.error("Error fetching user data:", userError.message);
                return NextResponse.redirect(`${origin}/error`);
            }

            // Check if user exists in profiles table
            const { data: existingUser } = await supabaseAdmin
                .from("profiles")
                .select("*")
                .eq("email", data?.user?.email)
                .limit(1)
                .single();

            let username: string;

            if (!existingUser) {
                // Create a random number for user identificaiton oauth
                let idIsUnique = false;
                let randomId = Math.floor(Math.random() * 1000);
                // Check if the random ID is unique
                while ( idIsUnique === false) {
                    const {data: usernameID} = await supabaseAdmin
                    .from("profiles")
                    .select("username")
                    .contains("username", data?.user?.email+randomId.toString());

                    if (!usernameID) {
                        idIsUnique = true; // Unique ID found
                    }
                    else
                    {
                        randomId = Math.floor(Math.random() * 1000000000);
                    }
                    
                }
                
                username = (data?.user?.email?.split('@')[0] ?? "user") + randomId.toString();


                // Insert the new user into the profiles table
                const { error: dbError } = await supabaseAdmin.from("profiles").insert({
                    id: data?.user?.id,
                    email: data?.user?.email,
                    username: username, // Use email prefix as username if not set
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
            }

            const { data: updatedUser, error} = await supabase.auth.updateUser({
                data: {
                    display_name: data?.user?.user_metadata?.full_name || "User",
                    username: username, 
                    nickname: data?.user?.user_metadata?.nickname || "No Nickname"
                }
            })
            
            
            const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                // No load balancer in local environment, use original origin
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }
    
  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 

