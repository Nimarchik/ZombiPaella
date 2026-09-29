import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  login,
} from "../../services/authService";

import {
  supabase,
} from "../../services/supabase.js";

import style from "../../styles/index.module.css";


const Login = () => {

  const navigate = useNavigate();


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);


  // =========================================================
  // CHECK SAVED SESSION
  // =========================================================

  useEffect(() => {

    let mounted = true;


    const checkSession =
      async () => {

        const {
          data: {
            session,
          },
          error,
        } =
          await supabase.auth.getSession();


        if (!mounted) {
          return;
        }


        if (error) {

          console.error(
            "SESSION CHECK ERROR:",
            error
          );

          setCheckingSession(false);

          return;
        }


        if (session?.user) {

          navigate(
            "/profile",
            {
              replace: true,
            }
          );

          return;
        }


        setCheckingSession(false);

      };


    checkSession();


    // =======================================================
    // AUTH STATE CHANGES
    // =======================================================

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          event,
          session
        ) => {

          if (
            !mounted
          ) {
            return;
          }


          if (
            event === "SIGNED_IN" &&
            session?.user
          ) {

            navigate(
              "/profile",
              {
                replace: true,
              }
            );

          }

        }
      );


    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, [
    navigate,
  ]);


  // =========================================================
  // LOGIN
  // =========================================================

  const handleLogin =
    async event => {

      event.preventDefault();


      setError("");

      setLoading(true);


      const {
        data,
        error,
      } =
        await login(
          email,
          password
        );


      setLoading(false);


      if (error) {

        setError(
          error.message
        );

        return;
      }


      if (
        data?.user
      ) {

        navigate(
          "/profile",
          {
            replace: true,
          }
        );

      }

    };


  // =========================================================
  // SESSION LOADING
  // =========================================================

  if (
    checkingSession
  ) {

    return (
      <div
        className={
          style.loginWrapper
        }
      >
        <p>
          Перевіряємо вхід...
        </p>
      </div>
    );

  }


  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <div
        className={
          style.loginWrapper
        }
      >

        <form
          className={
            style.loginForm
          }
          onSubmit={
            handleLogin
          }
        >

          <div
            className={
              style.card
            }
          >

            <a
              className={
                style.login
              }
            >
              Log in
            </a>


            <div
              className={
                style.inputBox
              }
            >

              <input
                className={
                  style.inputBoxIn
                }
                placeholder=" "
                type="email"
                value={email}
                onChange={
                  event =>
                    setEmail(
                      event.target.value
                    )
                }
                required
              />

              <span
                className={
                  style.user
                }
              >
                Email
              </span>

            </div>


            <div
              className={
                style.inputBox
              }
            >

              <input
                className={
                  style.inputBoxIn
                }
                placeholder=" "
                type="password"
                value={password}
                onChange={
                  event =>
                    setPassword(
                      event.target.value
                    )
                }
                required
              />

              <span>
                Password
              </span>

            </div>


            {error && (
              <p>
                {error}
              </p>
            )}


            <button
              className={
                style.enter
              }
              type="submit"
              disabled={
                loading
              }
            >
              {
                loading
                  ? "Вхід..."
                  : "Увійти"
              }
            </button>


            <button
              type="button"
              onClick={
                () =>
                  navigate(
                    "/register"
                  )
              }
            >
              Створити акаунт
            </button>

          </div>

        </form>

      </div>
    </>
  );

};


export default Login;