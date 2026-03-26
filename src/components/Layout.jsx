import Navbar from "./Navbar";

function Layout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        setUser(null); 
      }
    };
    fetchUser();
  }, []);

  return (
    <div>
      <Navbar user={user} />
      <main>{children}</main>
    </div>
  );
}

export default Layout;