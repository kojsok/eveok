
// import LoginButton from "@/components/LoginButton";
import SkillQueue from "@/components/SkillQueue";
import Skills from "@/components/Skills";
import UserInfo from "@/components/UserInfo";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">

      {/* <LoginButton /> */}
      <UserInfo />

      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-4 mt-8">

        <div className="w-full md:w-1/2">

          <Skills />

        </div>
        <div className="w-full md:w-1/2">
          <SkillQueue />

        </div>
      </div>
    </div>
  );
}

