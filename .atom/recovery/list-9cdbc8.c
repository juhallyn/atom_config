/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   list.c                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: juhallyn <juhallyn@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2017/06/26 16:49:56 by juhallyn          #+#    #+#             */
/*   Updated: 2017/08/15 10:37:40 by julien           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include "./ft_ls.h"

t_path			*create_node(t_data *data)
{
	t_path	*new;

	new = (t_path*)malloc(sizeof(t_path));
	if (!new)
		exit(-1);
	new->data = data;
	new->next = NULL;
	return (new);
}

t_path			*add_end(t_path *list, t_data *data)
{
	t_path *new;
	t_path *tmp;

	tmp = list;
	new = (t_path*)malloc(sizeof(t_path));
	if (!new)
		exit(-1);
	new->data = data;
	new->next = NULL;
	if (list == NULL)
		return (new);
	while (tmp->next)
		tmp = tmp->next;
	tmp->next = new;
	return (list);
}

static void		special_print(t_path *list)
{
	if (list->data->min_maj == false)
	{
		ft_putentab(list->data->group);
		ft_putnbr(list->data->file_size);
	}
	else
		print_major_minor(list->data->device);
	ft_putchar('\t');
	ft_putentab(list->data->time);
	if (list->data->is_symlink == true)
		print_symlink(list->data->d_name, list->data->path);
	else
	ft_putendl(list->data->d_name);
}

void			print_list(t_path *list, bool total)
{
	t_path	*tmp;
	short	block;

	block = 0;
	tmp = list;
	while (tmp)
	{
		if (block == 0 && total == true)
			print_blocks(all_blocks(list));
		block = 1;
		ft_putentab(tmp->data->permission);
		ft_putnbr(tmp->data->hard_link);
		ft_putchar('\t');
		ft_putentab(tmp->data->owner);
		special_print(tmp);
		tmp = tmp->next;
	}
}

void			simple_print(t_path *list)
{
	t_path *tmp;

	tmp = list;
	while (tmp)
	{
		ft_putendl(tmp->data->d_name);
		tmp = tmp->next;
	}
}
