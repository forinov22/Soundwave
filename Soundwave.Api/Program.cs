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
    options.UseInMemoryDatabase("Soundwave"));

builder.Services
    .AddApplicationServices(builder.Configuration)
    .AddAuthServices(builder.Configuration)
    .AddMlServices(builder.Configuration)
    .AddCorsPolicy();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("frontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(db);
}

app.Run();
