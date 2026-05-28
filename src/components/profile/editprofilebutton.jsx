```jsx
// src/components/Profile/EditProfileButton.jsx

const EditProfileButton = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        inline-flex
        items-center
        justify-center
        rounded-2xl
        bg-[#003C43]
        px-6
        py-3
        text-sm
        font-semibold
        text-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:bg-[#135D66]
        hover:shadow-md
        focus:outline-none
        focus:ring-2
        focus:ring-[#77B0AA]
      "
    >
      Edit Profile
    </button>
  );
};

export default EditProfileButton;
```
