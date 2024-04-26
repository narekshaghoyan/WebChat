const users = new Map(); // Change to Map

const userJoin = (id, username, room) => {
  const user = { id, username, room };
  users.set(id, user); // Use set method for Map

  return user;
};

const getCurrentUser = (id) => {
  return users.get(id); // Use get method for Map
};

const userLeave = (id) => {
  const user = users.get(id); // Retrieve user directly from Map
  if (user) users.delete(id); // Use delete method for Map
  return user;
};

const getRoomUsers = (room) => {
  return Array.from(users.values()).filter((user) => user.room === room); // Convert Map values to array and then filter
};

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
