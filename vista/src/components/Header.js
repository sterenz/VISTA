import React from "react";

function Header() {
  return (
    <header>
      <div className="w-full mx-auto flex justify-between py-6 items-center">
        <img className="h-6 w-auto" src="/LOGO.png" alt="" />
        <img className="h-10 w-auto" src="/AVATAR.png" alt="" />
      </div>
    </header>
  );
}
export default Header;
