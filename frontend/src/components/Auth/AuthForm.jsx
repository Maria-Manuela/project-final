import { useState } from "react";
import { useModal } from "./ModalContext";
import { signup, login as authLogin } from "./AuthService";
import signUpImage from "/images/signUp.jpg";

export const DEMO_ACCOUNT = {
  username: "demo",
  password: "demo1234",
};

const authErrorMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return "The server is still starting. Wait a moment and try again.";
  }
  if (!error.response) {
    return "Can't reach the server. It may be waking up — wait about a minute and try again.";
  }
  return "An error occurred during the authentication process. Try again!";
};

export const AuthForm = ({ type, onSuccess }) => {
  const { hideModal, login } = useModal();
  const [formMode, setFormMode] = useState(type);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState(null);
  const [role, setRole] = useState("Listener");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    if (newUsername.length < 3) {
      setUsernameError("Username must be at least 3 characters long.");
    } else {
      setUsernameError("");
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameError || passwordError) {
      setError("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let userData;
      if (formMode === "signup") {
        userData = await signup(username, password, role);
      } else {
        userData = await authLogin(username, password);
      }
      login(userData);
      hideModal();
      onSuccess();
    } catch (error) {
      setError(authErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 items-center justify-center bg-dark bg-opacity-50 z-50 flex">
      <div className="relative bg-light rounded-lg shadow-lg overflow-hidden w-2xl max-w-3xl flex flex-col md:flex-row p-4">
        <button
          aria-label="Close"
          className="absolute top-4 right-4 text-2xl font-bold text-primary hover:text-secondary"
          onClick={hideModal}
        >
          x
        </button>
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img
            src={signUpImage}
            alt="Sign up"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-12">
          <p className="text-sm text-dark mb-4">
            First login after a pause can take up to a minute while the free
            server starts.
          </p>
          <p className="text-sm text-dark mb-4">
            Demo: <span className="font-bold">{DEMO_ACCOUNT.username}</span> /{" "}
            <span className="font-bold">{DEMO_ACCOUNT.password}</span>
            <button
              type="button"
              className="block mt-1 text-primary underline focus:outline-none"
              disabled={loading}
              onClick={() => {
                setFormMode("login");
                setUsername(DEMO_ACCOUNT.username);
                setPassword(DEMO_ACCOUNT.password);
                setUsernameError("");
                setPasswordError("");
                setError(null);
              }}
            >
              Fill demo login
            </button>
          </p>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading && (
            <p className="text-primary text-sm mb-4">
              Connecting… if the server was asleep this can take up to a minute.
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              aria-label="Username"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
              disabled={loading}
              className="block w-full mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {usernameError && (
              <div className="text-red-500 text-sm mb-3">{usernameError}</div>
            )}

            <input
              type="password"
              aria-label="Password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
              disabled={loading}
              className="block w-full mb-4 px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {passwordError && (
              <div className="text-red-500 text-sm mb-3">{passwordError}</div>
            )}

            {formMode === "signup" && (
              <div className="mb-4">
                <label className="block mb-2 font-bold">Role</label>
                <select
                  aria-label="Select role"
                  value={role}
                  onChange={handleRoleChange}
                  disabled={loading}
                  className="block w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Listener">Listener</option>
                  <option value="Seeker">Seeker</option>
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-light px-4 py-2 rounded hover:bg-secondary w-full"
            >
              {loading
                ? "Starting server..."
                : formMode === "signup"
                ? "Sign Up"
                : "Log In"}
            </button>
          </form>
          <p className="mt-4 text-center md:text-left">
            {formMode === "signup"
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
            <button
              onClick={() =>
                setFormMode(formMode === "signup" ? "login" : "signup")
              }
              className="text-primary underline focus:outline-none"
              disabled={loading}
            >
              {formMode === "signup" ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
