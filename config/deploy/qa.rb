set :stage, :qa

server fetch(:server), roles: [:app], user: fetch(:user), group: fetch(:group)

set :branch, qa