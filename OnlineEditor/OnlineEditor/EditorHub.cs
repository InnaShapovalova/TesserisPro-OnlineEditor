using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;

namespace OnlineEditor
{
    public class EditorHub : Hub
    {
        private const string Name = "test";
        public void Send( string message)
        {
            // Call the broadcastMessage method to update clients.
            Clients.All.SendAsync(Name, message);
        }
    }
}
