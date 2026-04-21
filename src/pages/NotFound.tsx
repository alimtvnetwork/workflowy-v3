import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-md text-h1 text-foreground">404</h1>
        <p className="mb-xl text-bullet text-muted-foreground">
          This page doesn't exist.
        </p>
        <Link
          to="/"
          className="text-bullet text-primary underline hover:text-primary/80"
        >
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
