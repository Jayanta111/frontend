import React from "react";
import NavBar from "../components/NavBar";
import CallToAction from "../components/CallToAction";
import heroImage from "../assets/hero-image.png";

function Home() {
  const title = "Find out what's possible when work connects";
  const subtitle =
    "Whether you're chatting with teammates or supporting customers, Zoom makes it easier to connect, collaborate.";

  return (
    <>
  {/* Wrapper div for Navbar to create offset space */}
      <div className="fixed top-0 left-0 w-full z-50 bg-indigo-500/20 ">
        <NavBar />
      </div>

      {/* Spacer div — same height as navbar */}
      <div className="h-20 bg-indigo-500/20 " />
      {/* Hero Section */}
      <section
        className="relative flex flex-col md:flex-row items-center justify-center min-h-screen px-6 md:px-20 overflow-hidden"
        style={{
          gap:"20px",
          background: "linear-gradient(to bottom right, #E8ECF1, #F6F8FB)",
        }}
      >
        {/* Background decorative shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-400/20 rounded-full blur-3xl top-[-4rem] left-[-4rem]" />
          <div className="absolute w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl bottom-[-4rem] right-[-4rem]" />
        </div>

        {/* Left Side: Hero Image */}
        <div className="relative z-10 w-full md:w-1/2 flex justify-center md:justify-end mb-10 md:mb-0   "  >
          <img
            src={heroImage}
            alt="Hero Illustration"
            className="rounded-2xl w-5/6 sm:w-3/4 md:w-4/5 max-w-lg drop-shadow-xl object-contain animate-fadeIn mr-10"
          />
        </div>

        {/* Right Side: Text and Buttons */}
        <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-blue-900 leading-tight tracking-tight drop-shadow-md">
            {title}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-xl">
            {subtitle}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-5 mt-4">
            <CallToAction title="Host a Meeting" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
