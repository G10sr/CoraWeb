const urgencyStyles = {
  urgent: {
    icon: "🔴",
    label: "Urgent",
    color: "text-red-500",
  },

  normal: {
    icon: "🟡",
    label: "Normal",
    color: "text-yellow-500",
  },

  solved: {
    icon: "🟢",
    label: "Solved",
    color: "text-green-500",
  },
};

const PostUrgency = ({ urgency }) => {
  const current = urgencyStyles[urgency];

  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-[#F6F4EA]
        px-3
        py-1
        text-sm
        font-medium
      "
    >
      <span className={current.color}>
        {current.icon}
      </span>

      <span className="text-[#135D66]">
        {current.label}
      </span>
    </div>
  );
};

export default PostUrgency;
