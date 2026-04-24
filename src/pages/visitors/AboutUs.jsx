import "../../App.css";
import VisitorNavbar from "../../components/VisitorNavbar.jsx";

function AboutUs() {
  return (
    <div>
      <VisitorNavbar />

      <div className="min-h-screen bg-gray-50 text-gray-900">

        <section className="max-w-4xl mx-auto px-6 py-20">

          {/* HEADER */}
          <h1 className="text-3xl font-bold text-gray-900">
            About Us
          </h1>

          <p className="mt-4 text-gray-600">
            We built this platform to bridge the gap between people who want results
            and coaches who know how to deliver them. Fitness shouldn’t feel confusing,
            expensive, or out of reach.
          </p>

          {/* STORY SECTION */}
          <div className="mt-10 p-6 bg-white border rounded-xl shadow-sm">
            <h2 className="text-xl font-bold text-blue-800">
              Our Story
            </h2>

            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              This platform started with a simple problem — most people struggle to stay
              consistent in their fitness journey because they don’t have proper guidance.
              At the same time, many great coaches struggle to connect with the right clients.
            </p>

            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              We created this system to solve both problems by making coaching more
              accessible, structured, and transparent. Clients get real support, and
              coaches get meaningful relationships with the people they train.
            </p>
          </div>

          {/* MISSION / VISION */}
          <div className="mt-10 grid md:grid-cols-2 gap-4">

            <div className="p-5 bg-white border rounded-xl shadow-sm">
              <h3 className="font-bold text-blue-800">Our Mission</h3>
              <p className="text-sm text-gray-600 mt-2">
                Make high-quality coaching accessible to anyone, regardless of experience
                level or background.
              </p>
            </div>

            <div className="p-5 bg-white border rounded-xl shadow-sm">
              <h3 className="font-bold text-blue-800">Our Vision</h3>
              <p className="text-sm text-gray-600 mt-2">
                A world where personalized coaching is the standard, not a luxury.
              </p>
            </div>

          </div>

          {/* WHY IT EXISTS */}
          <div className="mt-10 p-6 bg-white border rounded-xl shadow-sm">

            <h2 className="text-xl font-bold text-blue-800">
              Why We Built This
            </h2>

            <ul className="mt-4 space-y-3 text-sm text-gray-600">
              <li>• Most fitness apps don’t provide real human accountability</li>
              <li>• Many people quit because they lack structure</li>
              <li>• Coaches need a better way to manage and grow clients</li>
              <li>• We wanted a simple system that connects both sides</li>
            </ul>

          </div>

          {/* VALUES */}
          <div className="mt-10 p-6 bg-white border rounded-xl shadow-sm">

            <h2 className="text-xl font-bold text-blue-800">
              What We Value
            </h2>

            <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-gray-600">

              <div>
                <p className="font-semibold text-gray-900">Simplicity</p>
                We keep everything easy to understand and use.
              </div>

              <div>
                <p className="font-semibold text-gray-900">Consistency</p>
                Long-term progress beats short-term hype.
              </div>

              <div>
                <p className="font-semibold text-gray-900">Accountability</p>
                Real results come from real guidance and tracking.
              </div>

            </div>

          </div>

        </section>
      </div>
    </div>
  );
}

export default AboutUs;