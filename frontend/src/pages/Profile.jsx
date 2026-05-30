{/* Avatar */}
{editing ? (

  <label className="cursor-pointer group relative">

    {avatarPrev || profile.avatar ? (

      <img
        src={
          avatarPrev
            ? avatarPrev
            : profile.avatar?.startsWith('http')
              ? profile.avatar
              : profile.avatar
                ? `https://socialconnect-backend-czfw.onrender.com${profile.avatar}`
                : 'https://placehold.co/200x200?text=Avatar'
        }

        alt="Profile"

        className="w-20 h-20 rounded-full object-cover ring-2 ring-[--border] shadow-lg"

        onError={(e) => {

          console.log(
            '❌ Avatar failed:',
            profile.avatar
          );

          e.target.src =
            'https://placehold.co/200x200?text=Avatar';
        }}
      />

    ) : (

      <Avatar
        user={profile}
        size={20}
      />
    )}


    {/* Overlay */}
    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">

      <Camera className="w-5 h-5 text-white" />

    </div>


    {/* File Input */}
    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={pickAvatar}
    />
  </label>

) : (

  <div className="relative">

    {profile.avatar ? (

      <img
        src={
          profile.avatar?.startsWith('http')
            ? profile.avatar
            : `https://socialconnect-backend-czfw.onrender.com${profile.avatar}`
        }

        alt="Profile"

        className="w-20 h-20 rounded-full object-cover ring-2 ring-[--border] shadow-lg"

        onError={(e) => {

          console.log(
            '❌ Avatar failed:',
            profile.avatar
          );

          e.target.src =
            'https://placehold.co/200x200?text=Avatar';
        }}
      />

    ) : (

      <Avatar
        user={profile}
        size={20}
      />
    )}
  </div>
)}