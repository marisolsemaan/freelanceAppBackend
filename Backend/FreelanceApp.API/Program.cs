using FreelanceApp.API.Data;
using FreelanceApp.API.Services.Documents;
using FreelanceApp.API.Services.Auth;
using FreelanceApp.API.Services.WorkerProfile;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using FreelanceApp.API.Services.Admin;
using FreelanceApp.API.Services.ClientProfile;
using FreelanceApp.API.Services.ClientJobPost;
using FreelanceApp.API.Services.WorkerJobPost;
using FreelanceApp.API.Services.HireOffer;
using FreelanceApp.API.Services.Conversation;
using FreelanceApp.API.Services.Verification;
using FreelanceApp.API.Services.Rating;
using System.Text;
using System.Text.Json.Serialization;
using FreelanceApp.API.Services.Lookup;
using FreelanceApp.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

var jwt = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwt["Key"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };

        options.Events= new JwtBearerEvents
        {
             OnMessageReceived = context =>
            {
            var accessToken =
                context.Request.Query["access_token"];

            var path =
                context.HttpContext.Request.Path;

            if (
                !string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/conversationHub")
            )
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
            }
        };
    });

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FreelanceApp API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddSignalR();
// Add services to the container.
builder.Services.AddOpenApi();
//return the type into a serialisable string instead of numbers for readability
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

builder.Services.AddScoped<DbConnectionFactory>();
builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IWorkerProfileService, WorkerProfileService>();
builder.Services.AddScoped<IAdminVerificationService, AdminVerificationService>();
builder.Services.AddScoped<IClientJobPostService, ClientJobPostService>();

builder.Services.AddScoped<IWorkerJobPostService,WorkerJobPostService>();

builder.Services.AddScoped< IClientProfileService,ClientProfileService>();

builder.Services.AddScoped<IHireOfferService, HireOfferService>();

builder.Services.AddScoped<IConversationService, ConversationService>();

builder.Services.AddScoped<IRatingService, RatingService>();

builder.Services.AddScoped<IUserVerificationService, UserVerificationService>();

builder.Services.AddScoped<ILookupService, LookupService>();

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

app.UseCors("frontend");      
app.UseAuthentication();      //  Check JWT token
app.UseAuthorization(); 
app.MapControllers();
app.MapHub<ConversationHub>("/conversationHub");

app.Run();


