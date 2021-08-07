"""Entrypoint script for invoking pq-dashboard on the command line"""
import argparse
import sys

import psycopg2

from pq_dashboard.cli.commands import cancel_all, cleanup, show_stats, start_dashboard


def get_parser() -> argparse.ArgumentParser:
    """Build a parser for CLI flags to the dashboard"""
    parser = argparse.ArgumentParser(
        "pq-dashboard",
        description="Web dashboard and CLI utility for managing PQ queues",
    )

    parser.add_argument(
        "--host", help="IP or hostname for server (default: 0.0.0.0)", default="0.0.0.0"
    )
    parser.add_argument(
        "--port", help="Port for server to listen on (default: 9182)", default=9182
    )

    subparsers = parser.add_subparsers(help="CLI help", dest="subcommand")

    stats_subparser = subparsers.add_parser("stats", help="Show queue statistics")
    stats_subparser.add_argument(
        "stats_queue_names",
        nargs="?",
        help="Comma-separated list of queue names to show stats for (optional, default is all queues)",
    )

    cleanup_subparser = subparsers.add_parser(
        "cleanup", help="Cleanup processed items from one-or-more queues"
    )
    cleanup_subparser.add_argument(
        "cleanup_queue_names",
        nargs="+",
        help="Comma-separated list of queue names to cleanup processed items from",
    )

    cancel_all_subparser = subparsers.add_parser(
        "cancel-all",
        help="Cancel queued items from one-or-more queues",
    )
    cancel_all_subparser.add_argument(
        "cancel_queue_names",
        nargs="+",
        help="Comma-separated list of queue names to cleanup processed items from",
    )

    return parser


def main():
    """Entrypoint (see pyproject.toml)"""
    parser = get_parser()

    flags = parser.parse_args()

    try:
        if flags.subcommand == None:
            start_dashboard(**vars(flags))
        elif flags.subcommand == "stats":
            show_stats(**vars(flags))
        elif flags.subcommand == "cleanup":
            cleanup(**vars(flags))
        elif flags.subcommand == "cancel-all":
            cancel_all(**vars(flags))
    except psycopg2.OperationalError as err:
        print()
        print(f"Error: Unable to connect to Postgres")
        print()
        print(err)
        print("Check your configuration")
        sys.exit(1)
