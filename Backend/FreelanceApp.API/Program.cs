using FreelanceApp.API.Data;
using FreelanceApp.API.Services.Documents;
using FreelanceApp.API.Services.Auth;
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<DbConnectionFactory>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IAuthService, AuthService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
// app.UseSwagger();
// app.UseSwaggerUI();
//app.UseHttpsRedirection();

app.MapControllers();

app.Run();


