const ProfileAvatar = ({ avatar, name }) => {
  return (
    <div className="relative h-32 w-32 shrink-0">
      {/* AVATAR IMAGE */}

      <img
        src={avatar}
        alt={`${name} profile`}
        className="
          h-full
          w-full
          rounded-3xl
          object-cover
          border-4
          border-white
          shadow-md
        "
      />

      {/* EDIT PLACEHOLDER BUTTON */}

      <button
        type="button"
        aria-label="Edit profile picture"
        className="
          absolute
          right-2
          top-2
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-[#003C43]
          text-white
          shadow-md
          transition-all
          duration-200
          hover:scale-105
          hover:bg-[#135D66]
          focus:outline-none
          focus:ring-2
          focus:ring-[#77B0AA]
        "
      >
        ✎
      </button>
    </div>
  );
};

export default ProfileAvatar;