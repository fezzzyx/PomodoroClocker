using PomodoroClocker.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace PomodoroClocker.Core.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);

    Task<User?> GetByUsernameAsync(string username);

    Task AddAsync(User user);

    Task SaveChangesAsync();
}