const ModalFooter = ({ children }) => {
  return (
    <div
      className="
        flex
        items-center
        justify-end
        gap-3
        border-t
        border-[#e8e3d6]
        px-6
        py-5
      "
    >
      {children}
    </div>
  );
};

export default ModalFooter;
