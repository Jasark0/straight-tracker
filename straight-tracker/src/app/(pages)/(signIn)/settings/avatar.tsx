'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import ReactiveButton from 'reactive-button'

export default function Avatar({
    uid,
    url,
    size,
    onUpload,
}: {
    uid: string | null
    url: string | null
    size: number
    onUpload: (url: string) => Promise<void> | void
}) {
    const supabase = createClient()
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url)
    const [uploading, setUploading] = useState(false)
    const [buttonState, setButtonState] = useState('idle')
    const [error, setError] = useState<string | null>(null)
    
    let reactiveButtonColor = 'blue'

    useEffect(() => {
        async function downloadImage(path: string) {
            try {
                const { data, error } = await supabase.storage.from('avatars').download(path)
                if (error) {
                    throw error
                }

                const url = URL.createObjectURL(data)
                setAvatarUrl(url)
            } catch (error) {
                console.log('Error downloading image: ', error)
            }
        }

        if (url) downloadImage(url)
    }, [url, supabase])

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
        try {
            setUploading(true)
            setButtonState('loading')
            setError(null)

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const filePath = `${uid}/${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            await onUpload(filePath)
            
            setButtonState('success')

            setTimeout(() => {
                setButtonState('idle')
            }, 2000)
            
        } catch (error: any) {
            setButtonState('error')
            setError(error.message || 'Error uploading avatar!')
            
            setTimeout(() => {
                setButtonState('idle')
                setError(null)
            }, 3000)
        } finally {
            setUploading(false)
        }
    }

    const handleUploadClick = () => {
        const fileInput = document.getElementById('single') as HTMLInputElement
        if (fileInput) {
            fileInput.click()
        }
    }

    if (buttonState === 'error') {
        reactiveButtonColor = 'red'
    } else if (buttonState === 'success') {
        reactiveButtonColor = 'green'
    } else if (buttonState === 'loading') {
        reactiveButtonColor = 'blue'
    } else {
        reactiveButtonColor = 'blue'
    }

    return (
        <div>
            <div style={{ width: size }}>
                <ReactiveButton
                    onClick={handleUploadClick}
                    idleText="Upload Avatar"
                    loadingText="Uploading..."
                    successText="Uploaded!"
                    errorText="Upload Failed"
                    buttonState={buttonState}
                    disabled={uploading}
                    rounded={true}
                    shadow={true}
                    width="100%"
                    size="normal"
                    color={reactiveButtonColor}
                />
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                        width: 0,
                        height: 0,
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
                {error && (
                    <p style={{ 
                        color: 'red', 
                        fontSize: '0.9rem', 
                        marginTop: '0.5rem',
                        textAlign: 'center' 
                    }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}