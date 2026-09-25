import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import style from '../../styles/index.module.css'

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error } = await login(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    console.log("USER:", data.user);

    navigate("/profile");
  };

  return (
    <>
      <div className={style.loginWrapper}>
        <form className={style.loginForm} onSubmit={handleLogin}>
          <div className={style.card}>
            <a className={style.login}>Log in</a>
            <div className={style.inputBox}>
              <input
                className={style.inputBoxIn}
                placeholder=" "
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                } required="required" />
              <span className={style.user}>Email</span>
            </div>

            <div className={style.inputBox}>
              <input
                className={style.inputBoxIn}
                placeholder=" "
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                } required="required" />
              <span>Password</span>
            </div>

            {error && (
              <p>{error}</p>
            )}

            <button
              className={style.enter}
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Вхід..."
                : "Увійти"}
            </button>
            <button
              type="button"
              onClick={() =>
                navigate("/register")
              }
            >
              Створити аккаунт
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;