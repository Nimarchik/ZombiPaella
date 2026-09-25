import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getRoom,
  getRoomPlayers,
  isPlayerInRoom,
  leaveRoom,
  closeRoom,
  startGame,
} from "../../services/roomService";

import {
  getCurrentUser,
} from "../../services/authService";

import { CopyToClipboard } from 'react-copy-to-clipboard';

import { supabase } from "../../services/supabase";

import style from "../../styles/index.module.css";

const Room = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roomError, setRoomError] = useState("");

  const [leaving, setLeaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [copied, setCopied] = useState(false);

  const isHost =
    currentUser?.id === room?.host_id;

  // -----------------------------
  // Загрузка игроков
  // -----------------------------

  const loadPlayers = useCallback(async () => {
    const {
      data,
      error,
    } = await getRoomPlayers(id);

    if (error) {
      console.error(
        "Помилка завантаення користувача:",
        error
      );

      return;
    }

    setPlayers(data ?? []);
  }, [id]);

  // -----------------------------
  // Первичная загрузка комнаты
  // -----------------------------

  useEffect(() => {
    const loadRoom = async () => {
      setLoading(true);
      setError("");

      // Получаем пользователя
      const {
        user,
        error: userError,
      } = await getCurrentUser();

      if (userError) {
        console.error(
          "Помилка отримання користувача:",
          userError
        );
      }

      if (!user) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      setCurrentUser(user);

      // Проверяем, находится ли пользователь
      // в этой комнате
      const {
        isMember,
        error: memberError,
      } = await isPlayerInRoom(
        id,
        user.id
      );

      if (memberError) {
        console.error(
          "Помилка перевірки кімнати:",
          memberError
        );

        setError(
          "Не вдалося перевірити кімнату"
        );

        setLoading(false);

        return;
      }

      if (!isMember) {
        navigate("/profile", {
          replace: true,
        });

        return;
      }

      // Получаем саму комнату
      const {
        data: roomData,
        error: roomError,
      } = await getRoom(id);

      if (roomError || !roomData) {
        console.error(
          "Помилка отримання кімнати:",
          roomError
        );

        setError(
          "Кімната не знайдена"
        );

        setLoading(false);

        return;
      }

      // Если комнату уже закрыли
      if (
        roomData.status === "closed"
      ) {
        navigate("/profile", {
          replace: true,
        });

        return;
      }

      // Если игра уже началась
      if (
        roomData.status === "playing"
      ) {
        navigate(`/game/${id}`, {
          replace: true,
        });

        return;
      }

      setRoom(roomData);

      await loadPlayers();

      setLoading(false);
    };

    loadRoom();
  }, [
    id,
    navigate,
    loadPlayers,
  ]);

  // -----------------------------
  // Realtime игроков
  // -----------------------------

  useEffect(() => {
    const channel = supabase
      .channel(`room-players-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_players",
          filter: `room_id=eq.${id}`,
        },
        () => {
          loadPlayers();
        }
      )
      .subscribe((status) => {
        console.log(
          "PLAYERS REALTIME:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    id,
    loadPlayers,
  ]);


  // -----------------------------
  // Realtime комнаты
  // -----------------------------

  useEffect(() => {
    const channel = supabase
      .channel(`room-status-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log(
            "ROOM UPDATE:",
            payload
          );

          const updatedRoom =
            payload.new;

          setRoom(updatedRoom);

          // Хост закрыл комнату
          if (
            updatedRoom.status ===
            "closed"
          ) {
            navigate(
              "/profile",
              {
                replace: true,
              }
            );

            return;
          }

          // Хост начал игру
          if (
            updatedRoom.status ===
            "playing"
          ) {
            navigate(
              `/game/${id}`,
              {
                replace: true,
              }
            );
          }
        }
      )
      .subscribe((status) => {
        console.log(
          "ROOM REALTIME:",
          status
        );
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    id,
    navigate,
  ]);

  // -----------------------------
  // Выход обычного игрока
  // -----------------------------

  const handleLeaveRoom = async () => {
    if (!currentUser) {
      return;
    }

    setRoomError("");
    setLeaving(true);

    const { error } =
      await leaveRoom(
        id,
        currentUser.id
      );

    setLeaving(false);

    if (error) {
      console.error(
        "Помилка виходу:",
        error
      );

      setRoomError(
        error.message
      );

      return;
    }

    navigate("/profile", {
      replace: true,
    });
  };

  // -----------------------------
  // Завершение комнаты хостом
  // -----------------------------

  const handleCloseRoom = async () => {

    if (!isHost) {
      return;
    }

    setRoomError("");
    setClosing(true);

    try {
      const {
        room: closedRoom,
        error,
      } = await closeRoom(id);

      console.log("CLOSE RESULT:", {
        closedRoom,
        error,
      });

      if (error) {
        setRoomError(error.message);
        return;
      }

      navigate("/profile", {
        replace: true,
      });
    } catch (error) {
      setRoomError(error.message);
    } finally {
      setClosing(false);
    }
  };

  // -----------------------------
  // Начало игры
  // -----------------------------

  const handleStartGame = async () => {
    if (!isHost) {
      return;
    }

    setRoomError("");
    setStarting(true);

    const { error } =
      await startGame(id);

    setStarting(false);

    if (error) {
      console.error(
        "Помилка запуска гри:",
        error
      );

      setRoomError(
        error.message
      );
    }
  };



  if (copied === true) {
    setTimeout(() => {
      setCopied(false)
    }, 3000)
  }

  // -----------------------------
  // Loading
  // -----------------------------

  if (loading) {

    return (

      <div
        className={
          style.loadingScreen
        }
      >

        <div
          className={
            style.loadingPot
          }
        >
          ☠
        </div>

        <p>
          Готуємо паелью...
        </p>

      </div>
    );
  }


  // -----------------------------
  // Error
  // -----------------------------

  if (error) {
    return (
      <div className={style.container}>

        <p>{error}</p>

        <button
          onClick={() =>
            navigate(
              "/profile"
            )
          }
        >
          Повернутися
        </button>

      </div>
    );
  }

  if (!room) {
    return null;
  }

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <section className={style.room}>
      <div className={style.container}>

        <div className={style.roomInner}>

          <h1 className={style.roomInnerTitle}>
            Лобі
          </h1>


          <div className={style.roomInnerClipboard}>
            <p className={style.roomInnerSub}>
              Код кімнати:
            </p>

            <CopyToClipboard text={room.code} onCopy={() => setCopied(true)}>
              <div className={style.roomInnerCopy}>
                <h2 className={style.roomInnerCopyKey}>
                  {room.code}
                </h2>
                <button className={style.roomInnerCopyBtn}>
                  {copied ? <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                      className={style.svgCopi} fill="currentColor" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                    </svg>
                  </> : <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className={style.svgCopi} viewBox="0 0 16 16">
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z" />
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z" />
                    </svg></>}
                </button>
              </div>
            </CopyToClipboard>
          </div>

          <p className={style.roomInnerPlayers}>
            Гравців:{" "}
            {players.length} з 5
          </p>

          {/* ИГРОКИ */}

          <div className={style.roomInnerPlayersList}>

            {players.map((player) => (
              <div key={player.id} className={style.roomInnerPlayersListItem}>
                <span >
                  {player.player_id === room.host_id
                    ? "👑"
                    : ""}
                </span>

                <span className={style.roomInnerPlayersListItemHost}>
                  {player.profiles?.nickname}
                </span>
              </div>
            ))}

          </div>

          {/* ОШИБКИ */}

          {roomError && (
            <p>
              {roomError}
            </p>
          )}

          {/* HOST */}

          {isHost ? (
            <div className={style.roomInnerButtns}>

              <div className={style.roomInnerButtnsBox}>


                <button className={starting ||
                  players.length <
                  2 ? style.profileCreateLobbyDisable : style.profileCreateLobby} onClick={handleStartGame}
                  disabled={
                    starting ||
                    players.length <
                    2
                  }>
                  <svg className={style.icon} id="Play" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path className="color000000 svgShape" fill="#ffffff" d="M12 39c-.549 0-1.095-.15-1.578-.447A3.008 3.008 0 0 1 9 36V12c0-1.041.54-2.007 1.422-2.553a3.014 3.014 0 0 1 2.919-.132l24 12a3.003 3.003 0 0 1 0 5.37l-24 12c-.42.21-.885.315-1.341.315z" />
                  </svg>
                  <span className={style.text}>
                    {starting
                      ? "Запуск..."
                      : "Почати гру"}
                  </span>
                </button>

                <button type="button" className={style.profileCreateLobbyClose} onClick={handleCloseRoom} disabled={closing}>

                  <svg className={style.icon} id="Play" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                  </svg>
                  <span className={style.text}>
                    {closing
                      ? "Завершення..."
                      : "Закрити кімнату"}
                  </span>
                </button>
              </div>
              <div className={style.roomInnerButtnsBoxErr}>
                {players.length < 2 && (
                  <p>
                    Для початку гри потрібно мінімум 2 гравці
                  </p>
                )}
              </div>

            </div>
          ) : (
            <div className={style.roomInnerButtns}>

              <button type="button" className={style.profileCreateLobbyClose} onClick={handleLeaveRoom} disabled={
                leaving
              }>

                <svg className={style.icon} id="Play" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                </svg>
                <span className={style.text}>
                  {leaving
                    ? "Вихід..."
                    : "Вийти з кімнати"}
                </span>
              </button>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default Room;