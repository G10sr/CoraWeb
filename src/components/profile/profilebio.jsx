```jsx
// src/components/Profile/ProfileBio.jsx

const ProfileBio = ({ name, bio }) => {
  return (
    <div className="flex flex-col gap-2">
      <h1
        className="
          text-4xl
          font-black
          tracking-tight
          text-[#003C43]
        "
      >
        {name}
      </h1>

      <p
        className="
          max-w-2xl
          text-base
          leading-relaxed
          text-[#135D66]
        "
      >
        {bio}
      </p>
    </div>
  );
};

export default ProfileBio;
```
