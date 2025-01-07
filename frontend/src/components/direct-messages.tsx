import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const users = [
  { id: 1, name: "John Doe", avatar: "/avatars/john.png", status: "online" },
  { id: 2, name: "Jane Smith", avatar: "/avatars/jane.png", status: "offline" },
  { id: 3, name: "Bob Johnson", avatar: "/avatars/bob.png", status: "online" },
]

export function DirectMessages() {
  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Direct Messages</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex items-center space-x-2">
            <div className="relative">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ${
                  user.status === "online" ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
            <span className="text-sm">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

