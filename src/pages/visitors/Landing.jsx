import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VisitorNavbar from "../../components/VisitorNavbar.jsx";
import api from "../../axios.jsx";
import { Link } from "react-router-dom";

function Landing() {
    const navigate = useNavigate();
    const [topCoaches, setTopCoaches] = useState([]);


    const handleClick = () => {
        navigate("/signup");
    };

    const handleClick2 = () => {
        navigate("/login");
    };


    useEffect(() => {
        const fetchTopCoaches = async () => {
            try {
                const response = await api.get("/coach/top-coach");
                console.log("Data received:", response.data)
                setTopCoaches(response.data.coaches);
            } catch (error) {
                console.error("Error fetching coaches:", error);
            }
        };

        fetchTopCoaches();
    }, []);

    return (
        <div className="w-full min-h-screen">

            <VisitorNavbar />

            <section className="w-full">
                {/* main background container */}
                <div className="bg-blue-800 h-[70vh] w-full flex items-center justify-start px-12 lg:px-24">

                    {/* The content wrapper: w-1/2 makes it take over half the parent */}
                    <div className="flex flex-col items-start text-left w-full md:w-1/2">

                        {/* Title */}
                        <h2 className="text-[7rem] font-bold mb-2 text-white leading-none pb-10">
                            FitNet
                        </h2>

                        {/* Paragraph: Using max-w to keep the text from getting too wide */}
                        <p className="text-white text-lg mb-8 opacity-90 leading-relaxed">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit.
                            Consequatur ipsum, veniam possimus iure doloribus placeat commodi,
                            assumenda laboriosam exercitationem rem, natus dolores ducimus voluptas.
                        </p>

                        {/* Button Container: Using gap instead of manual margins */}
                        <div className="flex gap-4">
                            <button
                                className=" bg-white text-blue-900 btn btn-primary rounded-box  w-36 h-12 text-lg"
                                onClick={handleClick}
                            >
                                Sign Up
                            </button>
                            <button
                                className="btn btn-outline text-blue rounded-box text-white w-36 h-12 text-lg"
                                onClick={handleClick2}
                            >
                                Log In
                            </button>
                        </div>

                    </div>
                </div>
            </section>
            <section className="py-10 px-6">
                <h2 className="text-3xl font-bold mb-6 text-center">Top Coaches</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topCoaches.map((coach) => (
                        <div key={coach.user_id} className="card bg-base-100 shadow-xl border border-base-300">

                            <div className="card-body items-center text-center">


                                <img
                                    src={coach.image}
                                    alt={coach.name}
                                    className="w-32 h-32 object-cover rounded-full mb-2"
                                />

                                <h2 className="card-title">{coach.name}</h2>

                                <p >{coach.specialty}</p>

                                <div className="flex items-center gap-1 mb-2">

                                    <p className="text-xl font-semibold">{coach.rating}</p>
                                    <span className="text-2xl text-yellow-400 mb-[0.25rem]">★</span>
                                </div>

                                <div className="card-actions mt-auto w-full ">
                                    <button className="btn btn-outline  btn-primary w-full">View Profile</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            <section className="py-10 px-6">
                <h2 className="text-3xl font-bold mb-6 text-center">Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {topCoaches.slice(0,2).map((coach) => (
                        <div key={coach.user_id} className="card bg-base-100 shadow-xl border border-base-300">
                            <div className="card-body items-center">
                                <h3 className="card-title mb-4">{coach.name}'s Transformation</h3>

                                {/* SIDE BY SIDE IMAGES */}
                                <div className="flex flex-row items-center justify-center gap-4 w-full py-4">

                                    {/* Before Photo */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="avatar">
                                            {/* w-48 is much bigger than the original w-32, but not "full screen" big */}
                                            <div className="w-80 h-80 rounded-2xl ring ring-blue-800 ring-offset-base-100 ring-offset-2 shadow-inner">
                                                <img
                                                    src={coach.before_photo}
                                                    alt="Before"
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                        <span className="badge bg-blue-800 border-none text-white font-bold py-3 px-6 shadow-sm">
                                            BEFORE
                                        </span>
                                    </div>

                                    {/* Subtle Arrow */}
                                    <div className="text-3xl text-base-300 font-light hidden lg:block px-2">➔</div>

                                    {/* After Photo */}
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-80 h-80 rounded-2xl ring ring-blue-800 ring-offset-base-100 ring-offset-2 shadow-inner">
                                                <img
                                                    src={coach.after_photo}
                                                    alt="After"
                                                    className="object-cover"
                                                />
                                            </div>
                                        </div>
                                        <span className="badge bg-blue-800 border-none text-white font-bold py-3 px-6 shadow-sm">
                                            AFTER
                                        </span>
                                    </div>

                                </div>

                                {/* Description text from your backend key: photo-description */}
                                <p className="mt-6 text-center italic text-base-content/70 max-w-md">
                                    "{coach['photo-description']}"
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );

}
export default Landing;
