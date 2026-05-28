const ModalHeader = ({
  title,
  onClose,
}) => {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-[#e8e3d6]
        px-6
        py-5
      "
    >
      <h2
        className="
          text-2xl
          font-bold
          text-[#003C43]
        "
      >
        {title}
      </h2>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close modal"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-[#135D66]
          transition-all
          duration-200
          hover:bg-[#F6F4EA]
          hover:rotate-90
          focus:outline-none
          focus:ring-2
          focus:ring-[#77B0AA]
        "
      >
        ✕
      </button>
    </div>
  );
};

export default ModalHeader;