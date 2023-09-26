import Image from "next/image";
import SizableButton from "./sizableButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 fill-inherit font-mono h-screen">
      {/*Navigation bar that has clickable add icon button on the right most side and current tab name on the left most side with a chevron left icon at the name's right */}
      <nav className="flex justify-between w-full items-center">
        <div className="flex items-center ml-8">
          <div className="flex flex-row items-center h-full m-2 p-2">
            <p className="text-lg xl:text-xl font-bold h-full mr-2">Draft 1</p>
            <SizableButton
              path="/icon_chevron_left.svg"
              alt="Expand Draft Menu"
            />
            {/* Dropdown show Command Palettes with preview */}
          </div>
        </div>
        <div className="flex items-center mr-8">
          <SizableButton path="/icon_add.svg" alt="Add Draft"/>
        </div>
      </nav>
      {/*Content Container has 2 tab container inside, 1 graph container at the left that takes half of the content width, 1 option container on the right that take the other half*/}
      <div className="flex flex-row w-full h-full">
        {/*Graph Container that has a graph image inside*/}
        <div className="flex flex-col w-1/2 h-full"></div>
        {/*Option Container that has 2 vertical tabs, one checkbox tab at the top, another text tab at the bottom*/}
        <div className="flex flex-col w-1/2 h-full">
          {/*Checkbox Tab that has a checkbox image inside*/}
          <div className="flex flex-col w-full h-1/2"></div>
          {/*Text Tab that has a text image inside*/}
          <div className="flex flex-col w-full h-1/2"></div>
        </div>
      </div>
    </main>
  );
}
