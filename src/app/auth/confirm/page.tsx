import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResendButton } from "@/components/auth/resend-button";

async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; email?: string }>;
}) {
  // Fallback text if someone visits the page directly without signing up
  const params = await searchParams;
  const email = params.email || "your email address";

  return (
    <div className="items-center justify-center flex">
      <div className="flex flex-col items-center justify-center w-[30%] mt-8">
        <h2 className="bold p-2">MC Ormoc Car Rental</h2>
        <Card className="w-full items-center justify-center py-8">
          <CardHeader className="flex flex-col justify-center items-center w-full">
            <CardTitle className="text-[20px]">Check Your Email</CardTitle>
            <CardDescription className="text-center ">
              To verify your identity, we've sent an email to{" "}
              <span className="bold text-black">{email}</span>.
              <br />
              Please click the link inside to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <ResendButton email={email} />
          </CardContent>
          <CardFooter className="text-[14px] text-center">
            <p>Nothing in sight? Check your spam folder or contact support</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ConfirmPage;
