
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace OnlineEditorMVC.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly IHubContext<EditorHub> _editorHub;

        public MessageController(IHubContext<EditorHub> editorHub)
        {
            _editorHub = editorHub; 
        }

        public class Message
        {
            public double StartX { get; set; }
            public double StartY { get; set; }
            public double EndX { get; set; }
            public double EndY { get; set; }
            public double TypeOfShape { get; set; }
            public string EventType { get; set; }
            public string ClientId { get; set; }

        }

        [HttpPost("send")]
        public async Task<ActionResult> SendMessage([FromBody] Message message)
        {
           
            await _editorHub.Clients.AllExcept(message.ClientId).SendAsync(message.EventType, message);

            return Ok();
        }
    }
}
