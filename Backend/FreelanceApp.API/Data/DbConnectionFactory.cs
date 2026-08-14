using Microsoft.Data.SqlClient;
using System.Data;

namespace FreelanceApp.API.Data;

public class DbConnectionFactory
{
    private readonly IConfiguration _configuration;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public SqlConnection CreateConnection()
    {
        var connectionString =
            _configuration.GetConnectionString("DefaultConnection");

        return new SqlConnection(connectionString);
    }
}