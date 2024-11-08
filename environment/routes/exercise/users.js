export const users = [
    { id: 1, username: "user1", password: "password1" },
    { id: 2, username: "user2", password: "password2" },
];

export function findUser(username) {
    return users.find((user) => user.username === username);
}

export function findUserById(id) {
    return users.find((user) => user.id === id);
}
