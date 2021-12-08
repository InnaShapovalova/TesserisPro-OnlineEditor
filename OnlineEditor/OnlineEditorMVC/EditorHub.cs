using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;

namespace OnlineEditorMVC
{
    public class EditorHub : Hub
    {
        public const string Name = "test";
    }
}
