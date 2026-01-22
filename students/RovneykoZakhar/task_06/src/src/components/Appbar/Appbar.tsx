"use client";
import Link from "next/link";
import { DropDown } from "./AppbarDropDown";
import Image from "next/image";

export default function Appbar() {
  return (
    <div className=" fixed z-30 top-0 left-0 right-0  flex justify-between items-center px-5 py-4 md:px-10 xl:px-20 bg-white shadow-md">
      <div className="text-emerald-500 font-bold text-3xl">
        <Link href={"/"}>
          <Image
            src="https://i.ibb.co/PsZFynfm/download.png"
            className="w-[130px]" alt={"image"} width={500} height={500}
          />
        </Link>
      </div>
      <div className="flex justify-between  w-[25%]">
        <div className=" font-semibold hover:text-emerald-500  text-xl hover:underline">
          <Link href={"/Landing/Features"}>
            {" "}
            <button>Features</button>
          </Link>
        </div>
        <div className=" font-semibold hover:text-emerald-500 hover:underline text-xl">
          {" "}
          <Link href={"/Landing/Blog"}>
            {" "}
            <button>Blog</button>
          </Link>
        </div>
        <div className=" font-semibold hover:text-emerald-500 hover:underline text-xl">
          {" "}
          <Link href={"/Landing/Review"}>
            {" "}
            <button>Review</button>
          </Link>
        </div>
      </div>
      <DropDown />
    </div>
  );
}
