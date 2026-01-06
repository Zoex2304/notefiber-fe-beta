import { Button } from "@/components/shadui/button";

export function GoogleSignInButton() {
  return (
    <Button
      variant="outline"
      className="w-full h-12 gap-3 text-base font-normal text-gray-700 border-gray-300 hover:bg-gray-50"
      type="button"
      onClick={() => {
        // Redirect user to backend Google OAuth endpoint
        console.log("Redirecting to Google Auth Backend...");
        window.location.href = "http://localhost:3000/api/auth/google";
      }}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Sign in with Google
    </Button>
  );
}
