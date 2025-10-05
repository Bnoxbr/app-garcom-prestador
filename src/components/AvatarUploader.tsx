import React, { useState } from 'react';

const AvatarUploader = ({ currentAvatarUrl, onUpload }: { currentAvatarUrl: string | null, onUpload: (file: File) => void }) => {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            onUpload(file);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <img 
                src={preview || `https://placehold.co/150x150/e2e8f0/4a5568?text=Avatar`} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300">
                Trocar Foto
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
    );
};

export default AvatarUploader;