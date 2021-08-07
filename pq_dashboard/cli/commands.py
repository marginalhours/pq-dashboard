"""This module contains command functions invoked by the CLI"""
from typing import List

import uvicorn

from pq_dashboard.connection import cursor_manager
from pq_dashboard.data.queues import (
    delete_processed_items,
    delete_queued_items,
    get_queue_stats,
)


def start_dashboard(host="0.0.0.0", port=9182, **kwargs):
    """Start the dashboard server"""
    print(
        f"Starting \x1b[1;38;5;14mpq-dashboard\x1b[0m on \x1b[1m{host}:{port}\x1b[0m..."
    )
    uvicorn.run("pq_dashboard.main:app", host=host, port=port, log_level="error")


def show_stats(stats_queue_names, **kwargs):
    """Prints a table of queue statistics to STDOUT"""
    stats_queue_names = (
        stats_queue_names.split(",") if stats_queue_names is not None else []
    )

    with cursor_manager() as cursor:
        data = get_queue_stats(cursor)

    if stats_queue_names:
        data = [queue for queue in data if queue.name in stats_queue_names]

    if len(data) == 0:
        print()
        print(f"  no queues matched: \x1b[1m{stats_queue_names}\x1b[0m")
        return

    max_name_length = (
        max([len(queue.name) for queue in data]) if len(data) > 1 else len(data[0].name)
    ) + 2

    SEP = "\x1b[38;5;7m╎\x1b[0m"

    header_format = (
        f"{SEP}{{:^{max_name_length}}}{SEP}{{:^10}}{SEP}{{:^11}}{SEP}{{:^10}}{SEP}"
    )
    row_format = (
        f"{SEP}{{:^{max_name_length}}}{SEP}{{:^10}}{SEP}{{:^11}}{SEP}{{:^10}}{SEP}"
    )

    header_text = header_format.format("Name", "Queued", "Processed", "Total")

    rows = []
    rows.append(
        "\x1b[38;5;7m"
        + "┌"
        + ("╌" * max_name_length)
        + "┬"
        + ("╌" * 10)
        + "┬"
        + ("╌" * 11)
        + "┬"
        + ("╌" * 10)
        + "┐"
        + "\x1b[0m"
    )
    rows.append(header_text)
    rows.append(
        "\x1b[38;5;7m"
        + "├"
        + ("╌" * max_name_length)
        + "┼"
        + ("╌" * 10)
        + "┼"
        + ("╌" * 11)
        + "┼"
        + ("╌" * 10)
        + "┤"
        + "\x1b[0m"
    )
    rows.extend(
        row_format.format(queue.name, queue.queued, queue.processed, queue.total)
        for queue in data
    )
    rows.append(
        "\x1b[38;5;7m"
        + "└"
        + ("╌" * max_name_length)
        + "┴"
        + ("╌" * 10)
        + "┴"
        + ("╌" * 11)
        + "┴"
        + ("╌" * 10)
        + "┘"
        + "\x1b[0m"
    )

    print()
    for row in rows:
        print("  " + row)


def cleanup(cleanup_queue_names, **kwargs):
    """Cleanup all processed tasks from the given queues

    Args:
        cleanup_queue_names: Comma-separated queues to clean
    """
    cleanup_queue_names = cleanup_queue_names[0].split(",")

    with cursor_manager() as cursor:
        data = get_queue_stats(cursor)
        data = {queue.name: queue for queue in data}

        print()

        for queue_name in cleanup_queue_names:
            if queue_name in data:
                delete_processed_items(cursor, queue_name)
                print(
                    f"  Cleaned up \x1b[1m{data[queue_name].processed}\x1b[0m processed items from queue \x1b[1m{queue_name}\x1b[0m"
                )
            else:
                print(f"Unknown queue: {queue_name}")


def cancel_all(cancel_queue_names, **kwargs):
    """Cancel all queued tasks from the given queues

    Args:
        cancel_queue_names: Comma-separated queues to cancel tasks from
    """
    cancel_queue_names = cancel_queue_names[0].split(",")

    with cursor_manager() as cursor:
        data = get_queue_stats(cursor)
        data = {queue.name: queue for queue in data}

        print()

        for queue_name in cancel_queue_names:
            if queue_name in data:
                delete_queued_items(cursor, queue_name)
                print(
                    f"  Cancelled all \x1b[1m{data[queue_name].queued}\x1b[0m queued items from queue \x1b[1m{queue_name}\x1b[0m"
                )
            else:
                print(f"Unknown queue: {queue_name}")
