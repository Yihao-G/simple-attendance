import { type NextPage } from "next";
import Head from "next/head";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "../utils/api";
import dayjs from "dayjs";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  const utils = api.useContext();

  const { data: checkins } = api.checkin.getAll.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );
  const doCheckin = api.checkin.checkin.useMutation({
    onSettled: async () => {
      await utils.checkin.getAll.refetch();
    }
  });

  const handleCheckin = async () => {
    await doCheckin.mutate();
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  };

  return (
    <>
      <Head>
        <title>Simple Attendance</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col justify-center gap-12 px-4 py-16">
          <AuthShowcase />
          {sessionData && (
            <>
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(min(100%,_200px),_1fr))] gap-4">
                {
                  checkins === undefined
                    ? <div className="text-white text-center">Loading</div>
                    : checkins.length === 0
                      ? <div className="text-white text-center">You don't have any checkins yet</div>
                      : checkins.map(({ date }) => (
                        <div
                          className="rounded-xl bg-white/10 p-4 text-white hover:bg-white/20 text-lg min-w-[200px]"
                        >
                          <div className="text-right font-medium">
                            {dayjs(date).format("D MMM YYYY")}
                          </div>
                          <div className="text-right font-light text-sm">
                            Checked in at {dayjs(date).format("HH:mm:ss")}
                          </div>
                        </div>
                      ))
                }
              </div>
              <div className="flex flex-col items-center gap-2 sticky bottom-5 z-50">
                <button
                  className="rounded-full bg-purple-500 px-10 py-3 text-lg font-semibold text-white no-underline transition hover:bg-purple-400 disabled:disabled:bg-white/5 disabled:bg-purple-200"
                  disabled={doCheckin.isLoading}
                  onClick={handleCheckin}
                >
                  {
                    doCheckin.isLoading
                      ? "Checking in..."
                      : "Check-In"
                  }
                </button>
                {
                  doCheckin.error && (
                    <span className="text-red-700 text-sm">
                      {doCheckin.error.message}
                    </span>
                  )
                }
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex items-center justify-between gap-4">
      {
        sessionData
          ? (
            <>
              <p className="text-center text-sm text-white">
                Logged in as <span className="font-bold">{sessionData.user?.name}</span>
              </p>
              <button
                className="rounded-full bg-white/10 px-10 py-1 text-sm font-semibold text-white no-underline transition hover:bg-white/20"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              className="rounded-full bg-white/10 px-10 py-3 text-xl font-semibold text-white no-underline transition hover:bg-white/20 mx-auto"
              onClick={() => void signIn("auth0")}
            >
              Sign in
            </button>
          )
      }
    </div>
  );
};
