import React, { FC } from "react";

type Props = {
  color: string
}

export const UpArrow: FC<Props> = ({ color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="13"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill={color}
        d="M6.75 18a1.25 1.25 0 102.5 0h-2.5zM8 2l.884-.884a1.25 1.25 0 00-1.768 0L8 2zm5.116 6.884a1.25 1.25 0 001.768-1.768l-1.768 1.768zm-12-1.768a1.25 1.25 0 101.768 1.768L1.116 7.116zM9.25 18V2h-2.5v16h2.5zM7.116 2.884l6 6 1.768-1.768-6-6-1.768 1.768zm0-1.768l-6 6 1.768 1.768 6-6-1.768-1.768z"
      ></path>
    </svg>
  );
}

export const DownArrow: FC<Props> = ({ color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="13"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill={color}
        d="M9.25 2a1.25 1.25 0 10-2.5 0h2.5zM8 18l-.884.884a1.25 1.25 0 001.768 0L8 18zm6.884-5.116a1.25 1.25 0 00-1.768-1.768l1.768 1.768zm-12-1.768a1.25 1.25 0 00-1.768 1.768l1.768-1.768zM6.75 2v16h2.5V2h-2.5zm2.134 16.884l6-6-1.768-1.768-6 6 1.768 1.768zm0-1.768l-6-6-1.768 1.768 6 6 1.768-1.768z"
      ></path>
    </svg>
  );
}

