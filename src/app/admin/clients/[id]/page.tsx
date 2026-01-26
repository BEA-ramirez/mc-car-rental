import { getUserById } from "@/actions/helper/get-users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserInfo from "@/components/clients/user-info";
import { toTitleCase } from "@/actions/helper/format-text";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientProfilePageProps {
  params: { id: string };
}

async function ClientProfilePage({ params }: ClientProfilePageProps) {
  const { id } = await params;
  const user = await getUserById(id);
  if (!user) {
    return <div>User not found</div>;
  }

  let historyLabel = "Rental History";
  if (user.role === "car_owner") historyLabel = "Asset Performance";
  if (user.role === "driver") historyLabel = "Trip History";
  if (["admin", "super_admin"].includes(user.role))
    historyLabel = "Activity Log";

  return (
    <div className="w-full h-screen">
      <div>
        <h2 className="text-2xl font-medium">{toTitleCase(user.full_name)}</h2>
        <p className="text-muted-foreground">
          <span className="font-mono text-xs">ID: {user.user_id}</span>
        </p>
      </div>
      <div className="mt-4">
        <Tabs defaultValue="overview" className="w-full">
          {/* THE TAB LIST (The Track) */}
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            {/* TAB 1: OVERVIEW */}
            <TabsTrigger
              value="overview"
              className="
        relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-2 pt-2 font-semibold text-muted-foreground shadow-none transition-none 
        data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none
      "
            >
              Overview
            </TabsTrigger>

            {/* TAB 2: DOCUMENTS */}
            <TabsTrigger
              value="documents"
              className="
        relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-2 pt-2 font-semibold text-muted-foreground shadow-none transition-none 
        data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none
      "
            >
              Documents
            </TabsTrigger>

            {/* TAB 3: HISTORY */}
            <TabsTrigger
              value="history"
              className="
        relative h-10 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-2 pt-2 font-semibold text-muted-foreground shadow-none transition-none 
        data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none
      "
            >
              {historyLabel}
            </TabsTrigger>
          </TabsList>

          {/* CONTENT */}
          <TabsContent value="overview" className="mt-4">
            <div className="w-full px-14 pb-12 ">
              <div className="flex flex-row-reverse mb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Settings />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="text-[0.8rem]">
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[0.8rem]">
                        Make as Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-[0.8rem]">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <UserInfo user={user} />
            </div>
          </TabsContent>
          <TabsContent value="documents" className="mt-6">
            Documents Content
          </TabsContent>
          {user.role === "driver" && <div></div>}
          <TabsContent value="history" className="mt-6">
            {user.role === "customer" && <div></div>}
            {user.role === "car_owner" && <div></div>}
            {["admin", "staff"].includes(user.role) && <div></div>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default ClientProfilePage;
