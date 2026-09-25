import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../../services/authService";
import style from '../../styles/index.module.css'

const Register = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    const { data, error } = await register(
      nickname,
      email,
      password
    );

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    console.log("REGISTER:", data);

    navigate("/profile");
  };

  return (
    <>

      <div className={style.registerWrapper}>
        <form onSubmit={handleRegister}>
          <div className={style.card}>
            <a className={style.singup}>Sign Up</a>
            <div className={style.inputBox}>
              <input type="email" placeholder=" " required="required"

                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
              />
              <span className={style.user}>Email</span>
            </div>
            <div className={style.inputBox}>
              <input type="text" placeholder=" "
                value={nickname}
                onChange={(event) =>
                  setNickname(event.target.value)
                }
                required
              />
              <span>Username</span>
            </div>
            <div className={style.inputBox}>
              <input type="password" placeholder=" "
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                minLength={6}
              />
              <span>Password</span>
            </div>
            {error && (
              <p>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={style.enter}
            >
              {loading
                ? "Створення..."
                : "Зареєструватися"}
            </button>
          </div>
        </form>
      </div>




      {/* <div>

        <h1>Регистрация</h1>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Никнейм"
            value={nickname}
            onChange={(event) =>
              setNickname(event.target.value)
            }
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            minLength={6}
          />

          {error && (
            <p>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Создание..."
              : "Зарегистрироваться"}
          </button>

        </form>

        <button
          onClick={() =>
            navigate("/login")
          }
        >
          Уже есть аккаунт
        </button>

      </div> */}
    </>);
};

export default Register;