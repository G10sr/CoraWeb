

const ProfileStats = ({ stats }) => {
  const statItems = [
    {
      label: "Connections",
      value: stats.connections,
    },
    {
      label: "Verified Posts",
      value: stats.verifiedPosts,
    },
    {
      label: "Total Posts",
      value: stats.totalPosts,
    },
  ];

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-3
        sm:grid-cols-3
      "
    >
      {statItems.map((item) => (
        <div
          key={item.label}
          className="
            flex
            min-w-[140px]
            flex-col
            rounded-2xl
            border
            border-[#d8d3c3]
            bg-[#F6F4EA]
            px-5
            py-4
            shadow-sm
            transition-all
            duration-200
            hover:-translate-y-1
            hover:shadow-md
          "
        >
          <span
            className="
              text-2xl
              font-bold
              text-[#003C43]
            "
          >
            {item.value}
          </span>

          <span
            className="
              text-sm
              font-medium
              text-[#135D66]
            "
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ProfileStats;
