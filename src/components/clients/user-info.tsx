import React from "react";
import { UserType } from "@/lib/schemas/user";
import { toTitleCase } from "@/actions/helper/format-text";
import Image from "next/image";
import { Pencil } from "lucide-react";

function UserInfo({ user }: { user: UserType }) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="h-[8rem] px-6 py-4 flex items-center justify-start gap-6 bg-white rounded-sm">
        <div className="h-full border-r border-gray-300 flex items-center justify-start gap-5 pr-6">
          <div className="w-22 h-22 relative">
            <Image
              src={
                user.profile_picture_url ||
                `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random&color=fff`
              }
              alt="User Avatar"
              fill
              className="object-cover w-full h-full rounded-full"
            />
          </div>
          <div className="flex flex-col items-start justify-center">
            <h3 className="font-medium text-xl text-[#222]">
              {toTitleCase(
                user.full_name ||
                  toTitleCase(user.first_name + " " + user.last_name),
              )}
            </h3>
            <p className="px-2 border text-[0.8rem] rounded-full bg-gray-400">
              {user.role}
            </p>
            <p className="text-[0.7rem] mt-1 text-gray-500">{user.user_id}</p>
          </div>
        </div>
        <div className="h-full flex items-center justify-start gap-4">
          <div className="flex flex-col items-start justify-center gap-3 text-gray-500 ">
            <h4 className="font-medium text-sm">First Name:</h4>
            <h4 className="font-medium text-sm">Phone No.:</h4>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 text-[#222]">
            <h4 className="font-medium text-sm">
              {toTitleCase(user.first_name)}
            </h4>
            <h4 className="font-medium text-sm">{user.phone_number}</h4>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 ml-8 text-gray-500">
            <h4 className="font-medium text-sm">Last Name:</h4>
            <h4 className="font-medium text-sm">Email:</h4>
          </div>
          <div className="flex flex-col items-start justify-center gap-3 text-[#222]">
            <h4 className="font-medium text-sm">
              {toTitleCase(user.last_name)}
            </h4>
            <h4 className="font-medium text-sm">{user.email}</h4>
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-6">
        <div className="h-full w-[60%] p-5 bg-white rounded-sm py-6">
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <h3 className="font-medium text-[0.9rem]">Personal Information</h3>
            <Pencil className="cursor-pointer w-6 h-6 p-1 mr-2" />
          </div>
          <div className="w-full flex items-center justify-between gap-3 mt-6">
            <div className="flex flex-col items-start justify-center text-[0.9rem] font-medium">
              <h4 className="text-gray-500">Gender</h4>
              <input type="text" value={"Female"} disabled className="mb-3" />
              <h4 className="text-gray-500">Emergency Contact</h4>
              <input type="text" value={"096438368435"} disabled />
            </div>
            <div className="flex flex-col items-start justify-center text-[0.9rem] font-medium">
              <h4 className="text-gray-500">Date of Birth</h4>
              <input
                type="text"
                value={"15th March, 1996"}
                disabled
                className="mb-3"
              />
              <h4 className="text-gray-500">Hometown</h4>
              <input type="text" value={"Ormoc City"} disabled />
            </div>
          </div>
          <div className="mt-4 w-full flex flex-col items-start justify-center text-[0.9rem] font-medium">
            <h4 className="text-gray-500">Permanent Address</h4>
            <input
              type="text"
              value={"1234 Elm Street, Springfield, USA, 56789"}
              disabled
              className="mb-3 w-full"
            />
            <h4 className="text-gray-500">Current Address</h4>
            <input
              type="text"
              value={"5678 Oak Avenue, Metropolis, USA, 12345"}
              disabled
              className="mb-3 w-full"
            />
          </div>
        </div>
        <div className="h-full w-[40%] p-5 bg-white rounded-sm py-6">
          <div className="flex items-center justify-between border-b border-gray-300 pb-4">
            <h3 className="font-medium text-[0.9rem]">Account Health</h3>
            <Pencil className="cursor-pointer w-6 h-6 p-1 mr-2" />
          </div>
          <div className="w-full flex items-center justify-start gap-20 mt-6 ">
            <div className="flex flex-col items-start justify-center text-[0.9rem] font-medium ">
              <h4 className="text-gray-500">Account Status</h4>
              <div className="flex items-center justify-start gap-3 mb-3">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <p>Active</p>
              </div>
              <h4 className="text-gray-500">Total Rentals</h4>
              <p>32</p>
            </div>
            <div className="flex flex-col items-start justify-center text-[0.9rem] font-medium">
              <h4 className="text-gray-500">Trust Score</h4>
              <p className="mb-3">83</p>
              <h4 className="text-gray-500">Total Spent</h4>
              <p>P1,200.00</p>
            </div>
          </div>
          <div className="mt-4 w-full flex flex-col items-start justify-center text-[0.9rem] font-medium">
            <h4 className="text-gray-500">Notes</h4>
            <input
              type="richtext"
              value={"1234 Elm Street, Springfield, USA, 56789"}
              className="mb-3 w-full h-20 text-start"
              disabled
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserInfo;
