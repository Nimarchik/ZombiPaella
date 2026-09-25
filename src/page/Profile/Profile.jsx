import { useEffect, useState } from "react";
import style from '../../styles/index.module.css'
import {
  getCurrentUser,
  logout,
} from "../../services/authService";
import {
  createRoom,
  joinRoom,
} from "../../services/roomService";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joining, setJoining] = useState(false);
  const [user, setUser] = useState(null);

  const handleJoinRoom = async () => {
    setJoinError("");

    if (!roomCode.trim()) {
      setJoinError("Введите код комнаты");
      return;
    }

    setJoining(true);

    const { user } = await getCurrentUser();

    if (!user) {
      setJoining(false);

      navigate("/login");

      return;
    }

    const {
      room,
      error,
    } = await joinRoom(
      user.id,
      roomCode
    );

    setJoining(false);

    if (error) {
      setJoinError(error.message);
      return;
    }

    navigate(`/room/${room.id}`);
  };

  useEffect(() => {

    const loadUser = async () => {

      const { user } =
        await getCurrentUser();

      setUser(user);

    };

    loadUser();

  }, []);

  const handleLogout = async () => {

    await logout();

    navigate("/login");

  };

  const handleCreateRoom = async () => {
    const { user } = await getCurrentUser();

    if (!user) {
      navigate("/login");
      return;
    }

    const { room, error } =
      await createRoom(user.id);

    if (error) {
      console.error(error);
      return;
    }

    navigate(`/room/${room.id}`);
  };

  return (
    <div className={style.profile}>
      <div className={style.container}>
        <div className={style.profileWrapper}>

          <h1 className={style.profileTitle}>Профиль</h1>

          {user && (
            <div className={style.profileNick}>
              <p className={style.profileNicknName}> {user.identities[0].identity_data.nickname}</p>
              <button className={style.btn} onClick={handleLogout}>
                <div className={style.sign}>
                  <svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" /></svg>
                </div>
                <div className={style.text2}>Logout</div>
              </button>
            </div>
          )}

          <div className={style.profileBoxBtn}>

            <button className={style.profileCreateLobby} onClick={handleCreateRoom}>
              <svg className={style.icon} id="Play" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path className="color000000 svgShape" fill="#ffffff" d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z" />
              </svg>
              <span className={style.text}>Створити Лобі</span>
            </button>



            <div className={style.inputGroup}>
              <input
                type="text"
                className={style.input}
                placeholder="Код комнаты" value={roomCode}
                onChange={(event) =>
                  setRoomCode(
                    event.target.value.toUpperCase()
                  )
                }
                maxLength={6} />
              <input
                className={style.buttonSubmit}
                defaultValue={joining
                  ? "Подключение..."
                  : "Присоединиться"}
                type="submit"
                onClick={handleJoinRoom}
                disabled={joining}
              />
              {joinError && (
                <p>
                  {joinError}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;