set :stage, :local

server fetch(:server), roles: [:local], user: fetch(:user), group: fetch(:group), no_release: true

set :code_path, fetch(:cap_config)["#{fetch(:stage)}"]['local_code_dir']