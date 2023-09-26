import NextImage from "next/image";

interface ButtonProps {
  path: string;
  alt: string;
  onClick?: () => void;
}

function SizableButton(props: ButtonProps): JSX.Element {
  const { path, alt, onClick } = props;
  return (
    <button type="button" className="relative w-8 h-8 xl:w-12 xl:h-12">
      <NextImage
        src={path}
        alt={alt}
        fill
        className="dark:invert"
        onClick={onClick}
      />
    </button>
  );
}

export default SizableButton;
