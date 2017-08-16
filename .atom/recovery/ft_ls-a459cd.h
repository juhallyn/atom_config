/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ft_ls.h                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: juhallyn <juhallyn@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/06/14 17:36:00 by juhallyn          #+#    #+#             */
/*   Updated: 2017/08/15 13:11:35 by juhallyn         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#ifndef FT_LS_H
# define FT_LS_H

# include "./libft/libft.h"
# include <dirent.h>
# include <errno.h>
# include <stdio.h>
# include <sys/stat.h>
# include <pwd.h>
# include <grp.h>
# include <time.h>
# include <sys/types.h>
# define FILE list_args->data->d_name
# define FOLDER dirs->data->d_name
# define NODE create_node

typedef enum	s_bool
{
	false = 0,
	true = 1
}				bool;

typedef struct			s_argv
{
	char				*argv;
	struct	s_arg		*next;
}						t_argv;

typedef struct			s_path
{
	struct stat			*buff;
	struct s_data		*data;
	struct s_path		*next;
	char				*path;
}						t_path;

typedef struct			s_data
{
	char		*path;
	char		*permission;
	nlink_t		hard_link;
	char		*owner;
	char		*group;
	off_t		file_size;
	char		*time;
	char		*d_name;
	blkcnt_t	blocks;
	dev_t		device;
	bool		min_maj;
	bool		is_symlink;
	char		*symlink;
	time_t		modif_time;
}						t_data;

typedef	struct			s_options
{
	bool	a_option;
	bool	R_option;
	bool	t_option;
	bool	l_option;
	bool	r_option;
}						t_ops;

/*
*	--	sort and check is arg is correct --
*		--> parse_arg.c
*/

bool		file_exists(const char* file);
void		open_arg(t_path *dirs, t_path *others, t_ops ops, int argc);
t_data		*init_argv_data(char *str);
t_path		*sort_argv(int argc, char **argv, t_ops ops);
void		separe_folders_files(t_path *list_args, t_path **dirs, \
			t_path **others, t_ops ops);

/*
*	--	short tools functions --
*		--> tools.c & tools2.c
*/

void 		ft_putentab(char *str);
char		*ft_error(char *name);
void		ft_putfolder(const char *s1);
blkcnt_t	all_blocks(t_path *list);
void		print_blocks(blkcnt_t blocks);
void		print_major_minor(dev_t device);
void		chose_print(t_path *list, t_ops ops, bool total);
bool		current_and_before_folder(char *d_name);
t_path		*init_path(char *path);
void		print_symlink(char *d_name, char *path);

/*
*	--	init data struct --
*		--> init_data.c
*/

t_data		*init_data(struct stat *buff, char *name, char *path);
t_data		*init_data_arg(struct stat *buff, char *name);

/*
*	--	data for -l option	--
*		--> data.c
*/

char		filetype(struct stat *buff);
char		*permission(struct stat *buff);
char		*owner(struct stat *buff);
char		*group(struct stat *buff);
char		*ft_time(struct stat *buff);

/*
*	--	extend data.c --
*		--> data2.c
*/

char		*link_name(char *path);

/*
*	--	PARSING OPTIONS --
*		--> option.c
*/

int			error_option(char bad_option);
int			check_options(char *options);
void		init_flags(char *options, t_ops **flags);
t_ops		parsing_option(int argc, char **argv, int *nb_arg);

/*
*	--	sort linked list --
*		--> sort.c
*/

void		chose_insert(t_path **list, t_path *new, t_ops ops);
void		insert_ascii(t_path **list, t_path *new);
void		insert_time(t_path **list, t_path *new);

/*
*	--	manage linked list and print_list --
*		--> list.c
*/

t_path		*add_head(t_path *list, t_data *data);
t_path		*add_end(t_path *list, t_data *data);
t_path		*create_node(t_data *data);
void		print_list(t_path *list, bool total);
void		simple_print(t_path *list);

/*
*	--	recursive for -R option --
*		--> recursive.c
*/

void		recursive(t_path *dirs, t_ops ops, int nb_arg);
void		dirs_in_dir(t_path *containt, char *name, t_ops ops);
void		do_recursive(t_path *directories, char *old_name, t_ops ops);

/*
*	--	--> main.c
*/

char		*creat_path(char *argv, char *d_name);
t_path		*ft_init(struct dirent *sd, char *argv, t_ops ops, DIR *dir);
t_path		*list_file(char *argv, t_ops ops);
t_path		*sort_argv(int argc, char **argv, t_ops ops);

/*
*	--	--> test
*/


#endif
