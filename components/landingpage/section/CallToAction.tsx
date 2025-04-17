import { Button } from "../../ui/Button";
import GetStartedButton from "../../ui/GetStartedButton";

const CallToAction = () => {
  return (
    <section className="py-24 px-6 md:px-10 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50"></div>

      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-16 max-w-6xl mx-auto relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-300 rounded-full -top-20 -right-20 blur-3xl opacity-20"></div>
        <div className="absolute w-96 h-96 bg-purple-300 rounded-full -bottom-20 -left-20 blur-3xl opacity-20"></div>

        <div className="relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to start your medical school journey?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of future medical professionals using our AI-powered
            platform to achieve their admission goals.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* <Button
              size="lg"
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg"
            >
              Get Started for Free
            </Button> */}
            <GetStartedButton />

            <Button
              variant="outline"
              size="lg"
              className="bg-white/80 backdrop-blur-sm border-cyan-200 text-cyan-600 px-8 py-6 text-lg"
            >
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
