

import { useState } from "react";

import ProfileAvatar from "./ProfileAvatar";
import ProfileStats from "./ProfileStats";
import ProfileBio from "./ProfileBio";
import EditProfileButton from "./EditProfileButton";
import EditProfileModal from "./EditProfileModal";

const ProfileHeader = ({
  profile,
  editingProfile,
  setEditingProfile,
  onSave,
}) => {
  const [draftProfile, setDraftProfile] = useState(profile);

  const handleOpenEdit = () => {
    setDraftProfile(profile);

    setEditingProfile(true);
  };

  const handleCloseEdit = () => {
    setEditingProfile(false);
  };

  const handleSave = () => {
    onSave(draftProfile);
  };

  return (
    <>
      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-[#d8d3c3]
          bg-white
          p-6
          shadow-sm
          transition-all
          duration-300
        "
      >
        {/* BACKGROUND DECORATION */}

        <div
          className="
            absolute
            right-0
            top-0
            h-52
            w-52
            rounded-full
            bg-[#77B0AA]/10
            blur-3xl
          "
        />

        {/* MAIN CONTENT */}

        <div
          className="
            relative
            z-10
            flex
            flex-col
            gap-8
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          {/* LEFT SIDE */}

          <div
            className="
              flex
              flex-col
              gap-6
              sm:flex-row
              sm:items-center
            "
          >
            <ProfileAvatar
              avatar={profile.avatar}
              name={profile.name}
            />

            <div className="flex flex-col gap-4">
              <ProfileBio
                name={profile.name}
                bio={profile.bio}
              />

              <ProfileStats stats={profile.stats} />
            </div>
          </div>

          {/* RIGHT SIDE */}

          <div className="flex items-center">
            <EditProfileButton onClick={handleOpenEdit} />
          </div>
        </div>
      </section>

      {/* EDIT MODAL */}

      {editingProfile && (
        <EditProfileModal
          draftProfile={draftProfile}
          setDraftProfile={setDraftProfile}
          onClose={handleCloseEdit}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default ProfileHeader;
