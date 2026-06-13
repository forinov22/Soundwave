using Microsoft.EntityFrameworkCore;
using Soundwave.Api.Data;
using Soundwave.Api.Entities;
using Soundwave.Api.Extensions;
using Soundwave.Api.Filters;
using Soundwave.Api.Helpers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers(options =>
    options.Filters.Add<DomainExceptionFilter>());
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services
    .AddApplicationServices(builder.Configuration)
    .AddAuthServices(builder.Configuration)
    .AddMlServices(builder.Configuration)
    .AddCorsPolicy();

var app = builder.Build();
var isDevelopment = app.Environment.IsDevelopment();

if (isDevelopment)
{
    app.MapOpenApi();
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
    await DbSeeder.SeedAsync(db);
}

app.Run();
