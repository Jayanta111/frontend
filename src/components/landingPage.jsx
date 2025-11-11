import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landingPageContainer">
      <nav>
        <div className="navHeader">
          <h2 className="text-2xl text-white">Vionex</h2>
        </div>
        <div className="navlist">
          <p>Join As Guest</p>
          <p> <Link to={"/auth"}>Register </Link></p>
          <div
            role="button"
            className="w-20 text-center rounded-lg bg-orange-400 hover:bg-gray-400"
          >
            <p className="font-semibold text-lg">
              {" "}
              <Link to={"/auth"}>Login</Link>
            </p>
          </div>
        </div>
      </nav>
      <div className="landingMainContainer">
        <div>
          <h1 className="  text-blue-600 ">
            <span className="font-bold" style={{ color: "#FF9839" }}>
              Vionex
            </span>{" "}
            — crystal-clear video, effortless meetings.
          </h1>
          <p className="text-lg text-white">
            Host secure video calls, webinars, and team huddles from anywhere
            <br /> — no fuss, just connect.
          </p>
          <div
            role="button"
            className="w-40 font-semiboldbold text-white text-center h-10 text-2xl text-bold rounded-lg bg-orange-400 hover:bg-blue-700 hover:shadow-amber-50-lg"
          >
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/Mobile.png" alt="Banner Image" />
        </div>
      </div>
    </div>
  );
}
