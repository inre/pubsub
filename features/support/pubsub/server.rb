module Pubsub
  class Server
    def initialize(debug: false)
      @io = IO.popen(debug ? 'DEBUG=pubsub:* npm start' : 'npm start')
      sleep 4 # FIXME: Should we watch the pid file or something else
    end

    def finalize
      unless @io.nil?
        Process.kill('TERM', @io.pid) # FIXME: QUIT doesn't help
        Process.wait(@io.pid)
        @io.each_line do |l|
          puts l
        end
      end
    end
  end
end
